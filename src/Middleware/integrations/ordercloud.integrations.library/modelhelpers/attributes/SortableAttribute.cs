﻿using System;

namespace ordercloud.integrations.library
{
    [AttributeUsage(AttributeTargets.Property)]
    public class SortableAttribute : Attribute
    {
        public int? Priority { get; set; }

        public bool Descending { get; set; }

        public SortableAttribute()
        {
        }

        public SortableAttribute(int priority)
        {
            Priority = priority;
        }
    }
}
