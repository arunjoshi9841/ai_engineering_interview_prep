from typing import Dict, Literal, NotRequired, TypedDict


class TraceEvent(TypedDict):
    tenant_id: str
    workflow_id: str
    trace_id: str
    span_id: str
    parent_span_id: NotRequired[str]
    step_id: str
    attempt: int
    type: Literal["workflow", "retrieval", "model", "tool", "approval"]
    timestamp_ms: int


class TraceIssue(TypedDict):
    code: Literal["duplicate_span", "missing_parent", "parent_cycle", "invalid_event"]
    span_id: NotRequired[str]


class TraceSummary(TypedDict):
    tenant_id: str
    workflow_id: str
    trace_id: str
    events: list[TraceEvent]
    issues: list[TraceIssue]

def correlateAgentTraces(events: list[TraceEvent]) -> list[TraceSummary]:
    
    grouped_traces = Dict[str,  list[TraceEvent]]()
    
    for event in events:
        key = f"{event['tenant_id']}|{event['workflow_id']}|{event['trace_id']}"
        if key not in grouped_traces:
            grouped_traces[key] = []
        grouped_traces[key].append(event)
    summaries: list[TraceSummary] = []
    
    for key, trace_events in grouped_traces.items():
        tenant_id, workflow_id, trace_id = key.split("|")
        issues: list[TraceIssue] = []
        
        # Check for duplicate spans
        span_map = Dict[str, TraceEvent]()
        span_ids = set()
        
        for event in trace_events:
            if event['span_id'] in span_ids:
                issues.append({"code": "duplicate_span", "span_id": event['span_id']})
            else:
                span_map[event['span_id']] = event
                span_ids.add(event['span_id'])
        
        for event in trace_events:
            if event['type'] not in ["workflow", "retrieval", "model", "tool", "approval"]:
                issues.append({"code": "invalid_event", "span_id": event['span_id']})
            
            if event['attempt'] < 0:
                issues.append({"code": "invalid_event", "span_id": event['span_id']})
            
            
            parent_span_id = event.get('parent_span_id')
            if parent_span_id and parent_span_id not in span_map:
                issues.append({"code": "missing_parent", "span_id": event['span_id']})
            
        visited = set()
        def detect_cycle(span_id: str, path: set[str]) -> bool:
            if span_id in path:
                return True
            nonlocal visited
            if span_id in visited:
                return False
            visited.add(span_id)
            path.add(span_id)
            
            parent_span_id = span_map[span_id].get('parent_span_id')
            
            if parent_span_id and detect_cycle(parent_span_id, path):
                return True
            path.remove(span_id)
            return False
        
        for span_id in span_ids:
            if span_id not in visited and detect_cycle(span_id, set()):
                issues.append({"code": "parent_cycle", "span_id": span_id})
        
        sorted_trace_events = sorted(trace_events, key=lambda e: e['timestamp_ms'] or e['span_id'])
        
        summaries.append({
            "tenant_id": tenant_id,
            "workflow_id": workflow_id,
            "trace_id": trace_id,
            "events": sorted_trace_events,
            "issues": issues
        })
    return summaries